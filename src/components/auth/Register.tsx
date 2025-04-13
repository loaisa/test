import { Paper, Typography, Box, Container, TextField, Button, IconButton, InputAdornment } from "@mui/material";
import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchRegister } from "../../store/slices/authSlice";
import { AppDispatch } from "../../store/store";
import { useForm } from "react-hook-form";

const Register = () => {
  const dispatch = useDispatch<AppDispatch>();  
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: 'loaisa.zhenya3@gmail.com',
      fullName: 'ddd1',
      password: 'qwerty',
    },
    mode: 'onChange',
  });

  const onSubmit =  (data: any) => {
    try {
      const response =  dispatch(fetchRegister(data));
      console.log(response)
      navigate('/')
    } catch (error: any) {
      console.log(error.response)
      setError(error.response?.data?.message || 'Произошла ошибка при регистрации');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5">
            Регистрация
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
              error={!!errors.email}
              helperText={errors.email?.message}
              {...register('email', {
                required: 'Email обязателен',
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: 'Email некорректен'
                }
              })}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="fullName"
              label="Имя"
              autoComplete="name"
              error={!!errors.fullName}
              helperText={errors.fullName?.message}
              {...register('fullName', {
                required: 'Имя обязательно',
                pattern: {
                  value: /^[а-яА-ЯёЁa-zA-Z\s]+$/,
                  message: 'Имя должно состоять из букв'
                },
                minLength: {
                  value: 2,
                  message: 'Имя должно содержать минимум 2 символа'
                }
              })}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Пароль"
              type="password"
              id="password"
              autoComplete="new-password"
              error={!!errors.password}
              helperText={errors.password?.message}
              {...register('password', {
                required: 'Пароль обязателен',
                minLength: {
                  value: 6,
                  message: 'Пароль должен содержать минимум 6 символов'
                }
              })}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Зарегистрироваться
            </Button>
            <Button
              fullWidth
              variant="text"
              sx={{ mt: 1 }}
              component={Link}
              to="/login"
            >
              Уже есть аккаунт? Войти
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Register;
