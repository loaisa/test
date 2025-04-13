import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchLogin } from "../../store/slices/authSlice";
import { AppDispatch, RootState } from "../../store/store";
import { useForm } from "react-hook-form";

const Login = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuth } = useSelector((state: RootState) => state.auth);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuth) {
      navigate('/');
    }
  }, [isAuth, navigate]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: any) => {
    try {
      const response = await dispatch(fetchLogin(data));
      if (response.meta.requestStatus === 'rejected') {
        setError('Неверный email или пароль');
      }
    } catch (error: any) {
      setError(error.message || 'Произошла ошибка при входе');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Вход
        </Typography>
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
        <form 
          onSubmit={handleSubmit(onSubmit)}
          style={{ width: '100%' }}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            autoComplete="email"
            type="email"
            autoFocus
            {...register('email', { required: 'Email обязателен' })}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Пароль"
            type="password"
            id="password"
            autoComplete="current-password"
            {...register('password', { required: 'Пароль обязателен' })}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="success"
            sx={{ mt: 3, mb: 2 }}
          >
            Войти
          </Button>
          <Button
            component={Link}
            to="/register"
            fullWidth
            variant="text"
            sx={{ mt: 1 }}
          >
            Нет аккаунта? Зарегистрироваться
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default Login;