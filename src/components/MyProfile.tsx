import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Box, Avatar, Typography, Container } from '@mui/material';
const MyProfile = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    return (
        <Container maxWidth="xl">
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: '50vh', marginTop: 5, backgroundColor: '#fff2f2' }} >
                <Avatar sx={{ width: 100, height: 100 }} src={user?.avatarUrl} />
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }} >
                <Typography variant="h6">{user?.fullName}</Typography>
                <Typography variant="body1">{user?.email}</Typography>
            </Box>
        </Box>
        </Container>
    )
}

export default MyProfile    
