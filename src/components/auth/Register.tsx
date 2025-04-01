import { Paper, Typography, Box, Container, TextField, Button, IconButton, InputAdornment } from "@mui/material";
import { useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        fullName: '',
        password: '',
    })
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('') //состояние для ошибки
    const [loading, setLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { //обработчик изменения поля
        setFormData({ ...formData, [e.target.name]: e.target.value }) //обновляем state
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => { //обработчик отправки формы
        e.preventDefault()
    }
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
                id="fullName"
                label="Полное имя"
                name="fullName"
                autoComplete="name"
                value={formData.fullName}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Пароль"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? 'Зарегистрироваться...' : 'Зарегистрироваться'}
              </Button>
              {error && (
                <Typography color="error" sx={{ mt: 1 }}>
                  {error} Вася
                </Typography>
              )}
              <Button
                fullWidth
                variant="text"
                sx={{ mt: 1 }}
                href="/login"
              >
                Уже есть аккаунт? Войти
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    );
}

export default Register
