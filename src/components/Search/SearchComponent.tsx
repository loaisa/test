import { Paper, InputBase, IconButton, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/material/styles';
import { useState } from 'react';
import { debounce } from 'lodash';

const SearchBar = styled(Paper)(() => ({
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',

    width: '100%',
    maxWidth: 600,
    margin: '0 auto',
    borderRadius: 20,
    background: 'linear-gradient(to bottom, #fff8f8, #fff2f2)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease',
    '&:hover': {
        boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
        transform: 'translateY(-2px)',
    },
    '&:focus-within': {
        boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
        background: 'white',
    }
}));

const SearchInput = styled(InputBase)(() => ({
    marginLeft: '8px',
    flex: 1,
    fontSize: '1rem',
    '& .MuiInputBase-input': {
        padding: '12px',
        transition: 'all 0.3s ease',
        '&::placeholder': {
            color: '#666',
            opacity: 0.8,
        },
    },
}));

const SearchButton = styled(IconButton)(() => ({
    padding: '12px',
    color: '#666',
    transition: 'all 0.3s ease',
    '&:hover': {
        color: '#1976d2',
        transform: 'scale(1.1)',
    },
}));

interface SearchComponentProps {
    onSearch: (query: string) => void;
}

const SearchComponent = ({ onSearch }: SearchComponentProps) => {
    const [searchQuery, setSearchQuery] = useState('');



    const debouncedSearch = debounce((val:string) => {
        onSearch(val)
    }, 500);

    const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setSearchQuery(val);
        debouncedSearch(val)

    }

    return (
        <Box sx={{
            width: '100%',
            mb: 4,
            position: 'sticky',
            top: 20,
            zIndex: 1000,
        }}>
            <form >
                <SearchBar>
                    <SearchInput
                        placeholder="Поиск постов..."
                        value={searchQuery}
                        onChange={onChangeInput}
                    />
                    <SearchButton type="submit" aria-label="поиск">
                        <SearchIcon />
                    </SearchButton>
                </SearchBar>
            </form>
        </Box>
    );
};

export default SearchComponent; 