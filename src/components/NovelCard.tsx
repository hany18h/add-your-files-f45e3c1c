import { Link } from 'react-router-dom';
import { Novel } from '@/types/novel';

interface NovelCardProps {
  novel: Novel;
}

export function NovelCard({ novel }: NovelCardProps) {
  return (
    <div className="novel-card group">
      <img
        src={novel.cover}
        alt={novel.title}
        className="novel-card-image"
        loading="lazy"
      />
      <div className="novel-card-overlay">
        <Link to={`/novel/${novel.id}`} className="read-button">
          READ
        </Link>
      </div>
    </div>
  );
}
