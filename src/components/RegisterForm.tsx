// src/components/RegisterForm.tsx
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { TextField, Button, Box, Typography, InputAdornment, CircularProgress, Divider } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import KeyIcon from '@mui/icons-material/Key';
import GoogleIcon from '@mui/icons-material/Google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type FormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const schema = yup.object().shape({
  name: yup.string().required('Full Name is required'),
  email: yup.string().email('Email is not valid').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm Password is required'),
});

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { register: firebaseRegister, loginWithGoogle, error: authError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setRegisterError(null);
    console.log("data =>",data)

    try {
      console.log("Initiating Firebase registration...");
      // This will register with Firebase and sync to the backend
      await firebaseRegister(data.email, data.password);
      console.log("Registration successful, redirecting to work policy page");
      navigate('/work-policy');
    } catch (error: any) {
      console.error('Register error:', error);
      // Error message should come from the AuthContext
      setRegisterError(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setRegisterError(null);
    
    try {
      console.log("Initiating Google sign-in...");
      // This will authenticate with Google and sync to the backend
      await loginWithGoogle();
      console.log("Google sign-in successful, redirecting to work policy page");
      navigate('/work-policy');
    } catch (error: any) {
      console.error('Google register error:', error);
      // Error message should come from the AuthContext
      setRegisterError(error.message || 'Failed to register with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ maxWidth: 400, mx: 'auto', mt: 4, display: 'flex', flexDirection: 'column', gap: 2
        ,boxShadow: 3, borderRadius: 3, padding: 3
       }}
    >
      <Typography variant="h5" textAlign="center" gutterBottom>Register</Typography>

      <TextField
        label="Full Name"
        variant="outlined"
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <AccountCircleIcon sx={{ marginRight: 1 }} />
            </InputAdornment>
          ),
        }}
        {...register('name')}
        error={!!errors.name}
        helperText={errors.name?.message}
        fullWidth
        disabled={isLoading}
      />

      <TextField
        label="Email"
        type="email"
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
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
            <InputAdornment position='start'>
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

      <TextField
        label="Confirm Password"
        type="password"
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <KeyIcon sx={{ marginRight: 1 }} />
            </InputAdornment>
          ),
        }}
        {...register('confirmPassword')}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
        fullWidth
        disabled={isLoading}
      />

      <Button 
        variant="contained" 
        type="submit" 
        fullWidth
        disabled={isLoading}
      >
        {isLoading ? <CircularProgress size={24} /> : 'Register'}
      </Button>

      <Divider sx={{ my: 2 }}>OR</Divider>

      <Button 
        variant="outlined" 
        startIcon={<GoogleIcon />}
        onClick={handleGoogleSignIn}
        fullWidth
        disabled={isLoading}
      >
        Sign up with Google
      </Button>

      {(registerError || authError) && (
        <Typography color="error" textAlign="center">
          {registerError || authError}
        </Typography>
      )}

      <Typography variant="body2" textAlign="center" mt={2}>
        Already have an account <a href="/"
        style={{ color: '#1976d2', textDecoration: 'none' }}>Login</a>
      </Typography>
    </Box>
  );
};

export default RegisterForm;