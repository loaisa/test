import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { useState } from "react";
import {useNavigate } from "react-router-dom";

import { useDispatch } from "react-redux";
import { fetchLogin } from "../../store/slices/authSlice";
import { AppDispatch } from "../../store/store";
import { useForm } from "react-hook-form";

const Login = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate()


  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
  });
    const [error, setError] = useState('')
    

    const onSubmit = async (data: any) => { //обработчик отправки формы
      try {
        const response = await dispatch(fetchLogin(data));
        if (response.meta.requestStatus === 'fulfilled') { //если запрос выполнен успешно
          navigate('/');
        } else if (response.meta.requestStatus === 'rejected') { //если запрос выполнен с ошибкой
          setError('Неверный email или пароль');
        }
      } catch (error: any) {
        setError(error.response?.data?.message || 'Произошла ошибка при входе');
      }
    }

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
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              autoComplete="email"
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
              sx={{ mt: 3, mb: 2 }}
            >
              Войти
            </Button>
            <Button
                fullWidth
                variant="text"
                sx={{ mt: 1 }}
                href="/register"
              >
                Нет аккаунта? Зарегистрироваться
              </Button>
          </Box>
        </Box>
        </Container>
      );
}

export default Login;