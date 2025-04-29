// Create a new file: src/components/GifPicker.tsx
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  TextField, 
  Grid,
  IconButton
} from '@mui/material';
import { Close, Search } from '@mui/icons-material';
import { searchGIF, trendingGIF, GIF } from '../TenorAPI';
import '../styles/GifPicker.css';

interface GifPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (gifUrl: string) => void;
}

const GifPicker: React.FC<GifPickerProps> = ({ open, onClose, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [gifs, setGifs] = useState<GIF[]>([]);
  const [loading, setLoading] = useState(false);

  // Load trending GIFs on initial load
  useEffect(() => {
    if (open) {
      setLoading(true);
      trendingGIF()
        .then(results => setGifs(results))
        .finally(() => setLoading(false));
    }
  }, [open]);

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    const results = await searchGIF(searchQuery);
    setGifs(results);
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        <div className="gif-picker-header">
          <h2>Select a GIF</h2>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent>
        <div className="gif-search">
          <TextField
            fullWidth
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search GIFs..."
            onKeyPress={handleKeyPress}
            InputProps={{
              endAdornment: (
                <IconButton onClick={handleSearch}>
                  <Search />
                </IconButton>
              ),
            }}
          />
        </div>
        
        <div className="gif-results">
          {loading ? (
            <div className="gif-loading">Loading GIFs...</div>
          ) : (
            <Grid container spacing={2}>
              {gifs.map((gif) => (
                <Grid size={{xs: 4, sm: 3}} key={gif.id}>
                  <div 
                    className="gif-item"
                    onClick={() => onSelect(gif.url)}
                  >
                    <img 
                      src={gif.preview} 
                      alt={gif.title}
                      loading="lazy"
                    />
                  </div>
                </Grid>
              ))}
            </Grid>
          )}
          
          {!loading && gifs.length === 0 && (
            <div className="gif-no-results">
              No GIFs found. Try another search term.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GifPicker;