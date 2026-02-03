import { Link } from 'react-router-dom';
import { Search, Settings } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export function Header({ onSearch }: HeaderProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container flex items-center justify-between h-14 px-4">
        <Link to="/" className="text-xl font-black text-primary text-glow">
          LUNAR<span className="text-foreground">.</span>
        </Link>

        <div className="flex items-center gap-3">
          {showSearch ? (
            <form onSubmit={handleSearch} className="flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search novels..."
                className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm w-40 focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
              />
            </form>
          ) : null}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
          <Link
            to="/admin"
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
