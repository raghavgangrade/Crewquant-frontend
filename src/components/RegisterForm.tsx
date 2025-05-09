import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { TextField, Button, Box, Typography, InputAdornment } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import KeyIcon from '@mui/icons-material/Key';
import axios from 'axios';

type FormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const API_BASE_URL = 'https://crewquant.lirisoft.net/api';

const schema = yup.object().shape({
  name: yup.string().required('Full Name is required'),
  email: yup.string().email('Email is not valid').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords do not match')
    .required('Confirm Password is required'),
});

const RegisterForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit: SubmitHandler<FormData> = async data => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      alert('Registration successful!');
      reset();
      console.log(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        alert(`Error: ${error.response.data.message || 'Failed to register'}`);
        reset();
      } else {
        console.error('Error:', error);
        alert('An error occurred while registering. Please try again.');
      }
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
      />

      <Button variant="contained" type="submit" fullWidth>
        
        Register
      </Button>

      <Typography variant="body2" textAlign="center" mt={2}>
        Already have an account <a href="/"
        style={{ color: '#1976d2', textDecoration: 'none' }}>Login</a>
      </Typography>
    </Box>
  );
};

export default RegisterForm;
