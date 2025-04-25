import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';

import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { RootState } from '../store/store';

const pages = ['Главная'];
const settings = ['Профиль', 'Мои посты', 'Выйти'];

const API_URL = process.env.REACT_APP_API_URL;

const Header = () => {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const {isAuth, user} = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getAvatarUrl = () => {
    // Задаем имя облака
    const cloudName = "postlearn"; // Имя облака Cloudinary
    
    if (user?.avatarUrl) {
        // Если URL уже абсолютный
        if (user.avatarUrl.startsWith('http')) {
            return user.avatarUrl;
        }
        
        // Если путь в формате /uploads/postlearn/filename
        if (user.avatarUrl.includes('/uploads/postlearn/')) {
            const fileId = user.avatarUrl.split('/').pop();
            if (!fileId) return undefined; // Защита от ошибок
            
            // Формируем прямой URL Cloudinary без v1/
            const cloudinaryUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${fileId}`;
            return cloudinaryUrl;
        }
        
        // Для других форматов путей добавляем API_URL
        return `${API_URL}${user.avatarUrl}`;
    }
    return undefined;
  };

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              {pages.map((page) => (
                <MenuItem key={page} onClick={() => {
                  handleCloseNavMenu();
                  if (page === 'Главная') {
                    navigate('/');
                  }
                }}>
                  <Typography textAlign="center">{page}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page}
                onClick={() => {
                  handleCloseNavMenu();
                  if (page === 'Главная') {
                    navigate('/');
                  }
                }}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page}
              </Button>
            ))}
          </Box>
          {isAuth ? (
            <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
              <Typography sx={{ mr: 2 }}>{user?.fullName}</Typography>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar 
                    alt={user?.fullName || "User"} 
                    src={getAvatarUrl()} 
                    imgProps={{ crossOrigin: "anonymous" }}
                  />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {settings.map((setting) => (
                  <MenuItem key={setting} onClick={handleCloseUserMenu}>
                    <Typography sx={{ textAlign: 'center' }}
                    onClick={() => {
                      if (setting === 'Выйти') {
                        handleLogout()    ;
                      }
                      if (setting === 'Мои посты') {
                        navigate('/my-posts');
                      }
                      if (setting === 'Профиль') {
                        navigate('/my-profile');
                      }
                    }}
                    >{setting}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          ) : (
            <Box sx={{ flexGrow: 0 }}>
              <Typography>
                <Button onClick={() => navigate('/login')} sx={{ color: 'white' }}>Войти</Button>
                <Button onClick={() => navigate('/register')} sx={{ color: 'white' }}>Зарегистрироваться</Button>
              </Typography>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default Header;
