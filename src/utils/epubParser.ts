import JSZip from 'jszip';

export interface ParsedChapter {
  number: number;
  title: string;
  content: string;
}

export interface ParsedEpub {
  title: string;
  author: string;
  chapters: ParsedChapter[];
  coverUrl: string | null;
}

export async function parseEpubFile(file: File): Promise<ParsedEpub> {
  const zip = new JSZip();
  const contents = await zip.loadAsync(file);
  
  let title = file.name.replace('.epub', '');
  let author = 'Unknown Author';
  let coverUrl: string | null = null;
  const chapters: ParsedChapter[] = [];

  const containerFile = contents.file('META-INF/container.xml');
  let rootFilePath = 'OEBPS/content.opf';
  
  if (containerFile) {
    const containerXml = await containerFile.async('text');
    const rootFileMatch = containerXml.match(/full-path="([^"]+)"/);
    if (rootFileMatch) {
      rootFilePath = rootFileMatch[1];
    }
  }

  const rootDir = rootFilePath.substring(0, rootFilePath.lastIndexOf('/') + 1);
  const opfFile = contents.file(rootFilePath);
  
  if (opfFile) {
    const opfContent = await opfFile.async('text');
    
    const titleMatch = opfContent.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/i);
    if (titleMatch) {
      title = titleMatch[1];
    }
    
    const authorMatch = opfContent.match(/<dc:creator[^>]*>([^<]+)<\/dc:creator>/i);
    if (authorMatch) {
      author = authorMatch[1];
    }

    const coverIdMatch = opfContent.match(/name="cover"\s+content="([^"]+)"/i);
    if (coverIdMatch) {
      const coverId = coverIdMatch[1];
      const coverHrefMatch = opfContent.match(new RegExp(`id="${coverId}"[^>]*href="([^"]+)"`, 'i'));
      if (coverHrefMatch) {
        const coverPath = rootDir + coverHrefMatch[1];
        const coverFile = contents.file(coverPath);
        if (coverFile) {
          const coverData = await coverFile.async('base64');
          const ext = coverPath.split('.').pop()?.toLowerCase() || 'jpg';
          coverUrl = `data:image/${ext};base64,${coverData}`;
        }
      }
    }

    const spineMatches = opfContent.matchAll(/<itemref\s+idref="([^"]+)"/gi);
    const spineItems: string[] = [];
    for (const match of spineMatches) {
      spineItems.push(match[1]);
    }

    const manifestItems: { [id: string]: string } = {};
    const manifestMatches = opfContent.matchAll(/<item\s+[^>]*id="([^"]+)"[^>]*href="([^"]+)"[^>]*/gi);
    for (const match of manifestMatches) {
      manifestItems[match[1]] = match[2];
    }

    let chapterNum = 1;
    for (const itemId of spineItems) {
      const href = manifestItems[itemId];
      if (!href) continue;
      
      const filePath = rootDir + href;
      const chapterFile = contents.file(filePath);
      
      if (chapterFile) {
        const chapterContent = await chapterFile.async('text');
        
        let chapterTitle = `Chapter ${chapterNum}`;
        const h1Match = chapterContent.match(/<h1[^>]*>([^<]+)<\/h1>/i);
        const h2Match = chapterContent.match(/<h2[^>]*>([^<]+)<\/h2>/i);
        const titleTagMatch = chapterContent.match(/<title[^>]*>([^<]+)<\/title>/i);
        
        if (h1Match) {
          chapterTitle = h1Match[1].trim();
        } else if (h2Match) {
          chapterTitle = h2Match[1].trim();
        } else if (titleTagMatch && titleTagMatch[1].trim()) {
          chapterTitle = titleTagMatch[1].trim();
        }

        const bodyMatch = chapterContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        const bodyContent = bodyMatch ? bodyMatch[1] : chapterContent;

        if (bodyContent.trim().length > 100) {
          chapters.push({
            number: chapterNum,
            title: chapterTitle,
            content: bodyContent,
          });
          chapterNum++;
        }
      }
    }
  }

  if (chapters.length === 0) {
    const htmlFiles = Object.keys(contents.files)
      .filter(name => name.endsWith('.html') || name.endsWith('.xhtml'))
      .sort();

    let chapterNum = 1;
    for (const filePath of htmlFiles) {
      const file = contents.file(filePath);
      if (file) {
        const content = await file.async('text');
        const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        const bodyContent = bodyMatch ? bodyMatch[1] : content;
        
        if (bodyContent.trim().length > 100) {
          chapters.push({
            number: chapterNum,
            title: `Chapter ${chapterNum}`,
            content: bodyContent,
          });
          chapterNum++;
        }
      }
    }
  }

  return { title, author, chapters, coverUrl };
}
