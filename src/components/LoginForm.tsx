// src/components/LoginForm.tsx
import React, { useState } from "react";
import {useForm, SubmitHandler} from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { TextField, Button, Box, Typography, InputAdornment, CircularProgress, Divider } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import KeyIcon from '@mui/icons-material/Key';
import GoogleIcon from '@mui/icons-material/Google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
    const { loginWithEmail, loginWithGoogle, error: authError } = useAuth();
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
          await loginWithEmail(data.email, data.password);
          reset();
          navigate('/work-policy');
        } catch (error: any) {
          setLoginError(error.message || 'Failed to login');
          console.error('Login error:', error);
        } finally {
          setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
      setIsLoading(true);
      setLoginError(null);
      
      try {
        await loginWithGoogle();
        navigate('/work-policy');
      } catch (error: any) {
        setLoginError(error.message || 'Failed to login with Google');
        console.error('Google login error:', error);
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

          <Divider sx={{ my: 2 }}>OR</Divider>

          <Button 
            variant="outlined" 
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignIn}
            fullWidth
            disabled={isLoading}
          >
            Sign in with Google
          </Button>

          {(loginError || authError) && (
            <Typography color="error" textAlign="center">
              {loginError || authError}
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