import { useState } from 'react';
import { useLogin, useLoginWithOtpCode } from '../../API/Auth/auth.hook';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid2 as Grid,
  Link,
  CssBaseline,
  Avatar,
  CircularProgress
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router';

const LoginForm = () => {
  const loginMutation = useLogin();
  const loginWithOtpCodeMutation = useLoginWithOtpCode()
  const navigate = useNavigate();
  const [mobile, setMobile] = useState('');
  const [userId, setUserId] = useState();
  const [password, setPassword] = useState('');


  const [otpInputVisibility, setOtpInputVisibility] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();


    // CASE: send login API
    if (!otpInputVisibility) {
      loginMutation.mutate({ mobile, password }, {
        onSuccess: (data) => {
          // Handle successful login
          // localStorage.setItem('token', data.token); // Save token
          // navigate('/dashboard'); // Redirect to dashboard
          console.log('horaaaa');
          console.log({ dd: data });

          if (data) {
            if (data?.user) {
              setUserId(data?.user?.id);
              setOtpInputVisibility(true);
              alert(data?.user?.otp);
            }
          }

        },
        onError: (error) => {
          // Handle error (already shown in UI via isError state)
          console.error('Login failed:', error.message);
        }
      });
    } else if (userId) {
      // CASE: send loginWithOtpCode
      loginWithOtpCodeMutation.mutate({ userId, otpCode: password },
        {
          onSuccess: (data) => {
            // Handle successful login
            // localStorage.setItem('token', data.token); // Save token
            // navigate('/dashboard'); // Redirect to dashboard
            console.log('horaaaa');
            console.log({ bb: data });

            if (data) {
              if (data?.userDoc && data?.tokens) {
                 // Handle successful login
                  localStorage.setItem('__token__', data?.tokens?.access?.token); // Save token
                  navigate('/'); // Redirect to dashboard
              }
            }

          },
          onError: (error) => {
            // Handle error (already shown in UI via isError state)
            console.error('Login failed:', error.message);
          }
        })
    }

  };

  return (
    <Container component="main" maxWidth="xs" className="h-screen flex items-center">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 4,
          borderRadius: 2,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
          backgroundColor: 'background.paper'
        }}
        className="w-full"
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <LockOutlined />
        </Avatar>

        <Typography component="h1" variant="h5" className="mt-4">
          پنل ادمین
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }} className="w-full">
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Mobile"
            name="mobile"
            disabled={otpInputVisibility}
            autoComplete="mobile"
            autoFocus
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            variant="outlined"
            className="mb-4"
          />

          {otpInputVisibility && (
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="code"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              className="mb-6"
            />
          )}



          {loginMutation.isError && (
            <Typography color="error" className="mb-4 text-center">
              {loginMutation.error.message || 'Invalid credentials'}
            </Typography>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loginMutation.isPending}
            sx={{ mt: 2, mb: 2, py: 1.5 }}
          >
            {loginMutation.isPending ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              otpInputVisibility ? 'وارد شوید' : 'ارسال کد'
            )}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginForm;