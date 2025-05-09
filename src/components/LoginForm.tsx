import React, { useState } from "react";
import {useForm, SubmitHandler} from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { TextField, Button, Box, Typography, InputAdornment, CircularProgress } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import KeyIcon from '@mui/icons-material/Key';
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://crewquant.lirisoft.net/api';

type FormData = {
    email: string;
    password: string;
}

const schema = yup.object().shape({
  email: yup.string().email('Email is not valid').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const LoginForm: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);
    
    const {
      register, 
      handleSubmit, 
      formState: {errors},
      reset
    } = useForm<FormData>({
        resolver: yupResolver(schema),
    });
    
    const onSubmit: SubmitHandler<FormData> = async data => {
        setIsLoading(true);
        setLoginError(null);
        
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/login`, data, {
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          // Store token in localStorage
          localStorage.setItem('token', response.data.token);
          
          // Store user info if needed
          localStorage.setItem('user', JSON.stringify(response.data.user));
          
          console.log('Login successful:', response.data);
          reset();
          
          // Redirect to work policy page
          navigate('/work-policy');
        } catch (error) {
          if (axios.isAxiosError(error) && error.response) {
            setLoginError(error.response.data.error || 'Failed to login');
          } else {
            console.error('Error:', error);
            setLoginError('An error occurred while logging in. Please try again.');
          }
        } finally {
          setIsLoading(false);
        }
    };

    return (
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{maxWidth: 400, mx: 'auto', mt: 4, display: 'flex', flexDirection: 'column', gap: 2
            ,boxShadow: 3, borderRadius: 3, padding: 3}}
        >
          <Typography variant="h5" textAlign="center" gutterBottom>Login</Typography>
    
          <TextField
            label="Email"
            type="email"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ marginRight: 1 }} />
                </InputAdornment>
              ),
            }}
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
            fullWidth
            disabled={isLoading}
          />
    
          <TextField
            label="Password"
            type="password"
            InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <KeyIcon sx={{ marginRight: 1 }} />
                  </InputAdornment>
                ),
              }}
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
            fullWidth
            disabled={isLoading}
          />
    
          <Button 
            type="submit" 
            variant="contained" 
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Login'}
          </Button>

          {loginError && (
            <Typography color="error" textAlign="center">
              {'Failed to login'} 
            </Typography>
          )}

          <Typography variant="body2" textAlign="center" mt={2}>
              Don't have an account? <a href="/register"
              style={{ color: '#1976d2', textDecoration: 'none' }}>Register</a> 
          </Typography>
        </Box>
      );
    };

export default LoginForm;
