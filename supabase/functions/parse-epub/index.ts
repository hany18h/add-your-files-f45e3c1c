import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import * as fflate from "https://esm.sh/fflate@0.8.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChapterData {
  number: number;
  title: string;
  content: string;
  images: string[];
}

interface ParsedEpub {
  title: string;
  author: string;
  description: string;
  chapters: ChapterData[];
  coverUrl: string | null;
}

// Simple XML parser helper
function getTagContent(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : '';
}

function getAttr(xml: string, attr: string): string {
  const regex = new RegExp(`${attr}=["']([^"']*)["']`, 'i');
  const match = xml.match(regex);
  return match ? match[1] : '';
}

// Extract text content from HTML, preserving structure
function cleanHtml(html: string): string {
  // Remove XML declarations and doctype
  let cleaned = html.replace(/<\?xml[^>]*\?>/gi, '');
  cleaned = cleaned.replace(/<!DOCTYPE[^>]*>/gi, '');
  
  // Extract body content if present
  const bodyMatch = cleaned.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (bodyMatch) {
    cleaned = bodyMatch[1];
  }
  
  // Keep important formatting tags, clean up others
  cleaned = cleaned.replace(/<(\/?)html[^>]*>/gi, '');
  cleaned = cleaned.replace(/<(\/?)head[^>]*>[\s\S]*?<\/head>/gi, '');
  cleaned = cleaned.replace(/<meta[^>]*>/gi, '');
  cleaned = cleaned.replace(/<link[^>]*>/gi, '');
  
  return cleaned.trim();
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify user is admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check admin role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse multipart form data
    const formData = await req.formData();
    const epubFile = formData.get('epub') as File;
    const novelId = formData.get('novelId') as string;
    const language = (formData.get('language') as string) || 'en';

    if (!epubFile || !novelId) {
      return new Response(JSON.stringify({ error: 'Missing epub file or novelId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processing EPUB for novel ${novelId}, language: ${language}`);

    // Read the EPUB file as ArrayBuffer
    const arrayBuffer = await epubFile.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Unzip the EPUB
    let unzipped: fflate.Unzipped;
    try {
      unzipped = fflate.unzipSync(uint8Array);
    } catch (e) {
      console.error('Failed to unzip EPUB:', e);
      return new Response(JSON.stringify({ error: 'Invalid EPUB file - could not unzip' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('EPUB unzipped, files:', Object.keys(unzipped));

    // Find container.xml to get the OPF path
    const containerXml = new TextDecoder().decode(unzipped['META-INF/container.xml']);
    const opfPath = getAttr(containerXml, 'full-path');
    
    if (!opfPath) {
      return new Response(JSON.stringify({ error: 'Invalid EPUB - no OPF file found' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('OPF path:', opfPath);
    const opfDir = opfPath.substring(0, opfPath.lastIndexOf('/') + 1);
    const opfContent = new TextDecoder().decode(unzipped[opfPath]);

    // Extract metadata
    const metadata = getTagContent(opfContent, 'metadata') || getTagContent(opfContent, 'dc:metadata');
    const title = getTagContent(metadata, 'dc:title') || getTagContent(metadata, 'title') || 'Untitled';
    const author = getTagContent(metadata, 'dc:creator') || getTagContent(metadata, 'creator') || 'Unknown';
    const description = getTagContent(metadata, 'dc:description') || getTagContent(metadata, 'description') || '';

    console.log('Metadata:', { title, author });

    // Parse manifest to get item references
    const manifestContent = getTagContent(opfContent, 'manifest');
    const itemRegex = /<item[^>]+>/gi;
    const items: Record<string, { href: string; mediaType: string }> = {};
    
    let itemMatch;
    while ((itemMatch = itemRegex.exec(manifestContent)) !== null) {
      const itemXml = itemMatch[0];
      const id = getAttr(itemXml, 'id');
      const href = getAttr(itemXml, 'href');
      const mediaType = getAttr(itemXml, 'media-type');
      if (id && href) {
        items[id] = { href, mediaType };
      }
    }

    console.log('Manifest items:', Object.keys(items).length);

    // Parse spine to get reading order
    const spineContent = getTagContent(opfContent, 'spine');
    const itemrefRegex = /<itemref[^>]+>/gi;
    const spineOrder: string[] = [];
    
    let spineMatch;
    while ((spineMatch = itemrefRegex.exec(spineContent)) !== null) {
      const idref = getAttr(spineMatch[0], 'idref');
      if (idref && items[idref]) {
        spineOrder.push(idref);
      }
    }

    console.log('Spine order:', spineOrder.length, 'items');

    // Find and upload cover image
    let coverUrl: string | null = null;
    const coverMeta = opfContent.match(/<meta[^>]*name=["']cover["'][^>]*content=["']([^"']*)["'][^>]*>/i);
    const coverId = coverMeta ? coverMeta[1] : null;
    
    if (coverId && items[coverId]) {
      const coverPath = opfDir + items[coverId].href;
      const coverData = unzipped[coverPath];
      if (coverData) {
        const coverFileName = `covers/${novelId}_cover.${items[coverId].mediaType.split('/')[1] || 'jpg'}`;
        const { error: coverUploadError } = await supabase.storage
          .from('novels')
          .upload(coverFileName, coverData, { 
            contentType: items[coverId].mediaType,
            upsert: true 
          });
        
        if (!coverUploadError) {
          const { data: { publicUrl } } = supabase.storage.from('novels').getPublicUrl(coverFileName);
          coverUrl = publicUrl;
          console.log('Cover uploaded:', coverUrl);
        }
      }
    }

    // Process chapters
    const chapters: ChapterData[] = [];
    const uploadedImages: Record<string, string> = {};

    for (let i = 0; i < spineOrder.length; i++) {
      const itemId = spineOrder[i];
      const item = items[itemId];
      if (!item || !item.mediaType.includes('html')) continue;

      const filePath = opfDir + item.href;
      const fileData = unzipped[filePath];
      if (!fileData) continue;

      let content = new TextDecoder().decode(fileData);
      
      // Extract title from content or use filename
      let chapterTitle = '';
      const h1Match = content.match(/<h1[^>]*>([^<]+)<\/h1>/i);
      const h2Match = content.match(/<h2[^>]*>([^<]+)<\/h2>/i);
      const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
      
      chapterTitle = h1Match?.[1] || h2Match?.[1] || titleMatch?.[1] || `Chapter ${i + 1}`;
      chapterTitle = chapterTitle.replace(/<[^>]*>/g, '').trim();

      // Find and upload images in this chapter
      const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
      let imgMatch;
      const chapterImages: string[] = [];
      
      while ((imgMatch = imgRegex.exec(content)) !== null) {
        let imgSrc = imgMatch[1];
        
        // Resolve relative path
        const chapterDir = filePath.substring(0, filePath.lastIndexOf('/') + 1);
        let imgPath = imgSrc;
        if (!imgSrc.startsWith('/') && !imgSrc.startsWith('http')) {
          imgPath = chapterDir + imgSrc;
        }
        // Normalize path
        imgPath = imgPath.replace(/\/\.\//g, '/').replace(/[^/]+\/\.\.\//g, '');

        if (uploadedImages[imgPath]) {
          // Already uploaded
          content = content.replace(imgSrc, uploadedImages[imgPath]);
          chapterImages.push(uploadedImages[imgPath]);
        } else if (unzipped[imgPath]) {
          // Upload image
          const imgData = unzipped[imgPath];
          const imgExt = imgPath.split('.').pop() || 'jpg';
          const imgFileName = `images/${novelId}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${imgExt}`;
          
          const { error: imgUploadError } = await supabase.storage
            .from('novels')
            .upload(imgFileName, imgData, { 
              contentType: `image/${imgExt}`,
              upsert: true 
            });
          
          if (!imgUploadError) {
            const { data: { publicUrl } } = supabase.storage.from('novels').getPublicUrl(imgFileName);
            uploadedImages[imgPath] = publicUrl;
            content = content.replace(new RegExp(imgSrc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), publicUrl);
            chapterImages.push(publicUrl);
          }
        }
      }

      // Clean the HTML content
      const cleanedContent = cleanHtml(content);
      
      if (cleanedContent.length > 100) { // Skip very short/empty chapters
        chapters.push({
          number: chapters.length + 1,
          title: chapterTitle,
          content: cleanedContent,
          images: chapterImages,
        });
      }
    }

    console.log(`Extracted ${chapters.length} chapters`);

    // Delete existing chapters for this novel (for this language)
    const contentField = language === 'en' ? 'content_en' : 'content_id';
    
    // Insert or update chapters
    for (const chapter of chapters) {
      // Check if chapter exists
      const { data: existingChapter } = await supabase
        .from('chapters')
        .select('id')
        .eq('novel_id', novelId)
        .eq('number', chapter.number)
        .maybeSingle();

      if (existingChapter) {
        // Update existing chapter
        const { error: updateError } = await supabase
          .from('chapters')
          .update({
            title: chapter.title,
            [contentField]: chapter.content,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingChapter.id);
        
        if (updateError) {
          console.error('Error updating chapter:', updateError);
        }
      } else {
        // Insert new chapter
        const { error: insertError } = await supabase
          .from('chapters')
          .insert({
            novel_id: novelId,
            number: chapter.number,
            title: chapter.title,
            [contentField]: chapter.content,
          });
        
        if (insertError) {
          console.error('Error inserting chapter:', insertError);
        }
      }
    }

    // Update novel cover if extracted
    if (coverUrl) {
      await supabase
        .from('novels')
        .update({ cover_url: coverUrl })
        .eq('id', novelId);
    }

    const result: ParsedEpub = {
      title,
      author,
      description,
      chapters: chapters.map(c => ({ ...c, content: c.content.substring(0, 200) + '...' })), // Truncate for response
      coverUrl,
    };

    console.log('EPUB parsing complete');

    return new Response(JSON.stringify({
      success: true,
      data: result,
      chaptersCount: chapters.length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('EPUB parsing error:', errorMessage);
    return new Response(JSON.stringify({ 
      error: 'Failed to parse EPUB',
      details: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
