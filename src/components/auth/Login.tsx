import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useDispatch } from "react-redux";
import { login } from "../../store/slices/authSlice";
import { AppDispatch } from "../../store/store";

const Login = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate()

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })
    const [error, setError] = useState('')
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { //обработчик изменения поля
        setFormData({ ...formData, [e.target.name]: e.target.value }) //обновляем state
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => { //обработчик отправки формы
      e.preventDefault() //отменяем перезагрузку страницы
      try{
        const response = await dispatch(login(formData))
        console.log(response)
        navigate('/')   
      }catch(error: any){
        setError(error.response.data.message)
        console.log(error)
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
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Пароль"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
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