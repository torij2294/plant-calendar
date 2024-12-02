import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { signIn, useGoogleAuth } from '@/services/auth';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { handleGoogleAuth } = useGoogleAuth();

  const handleLogin = async () => {
    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await handleGoogleAuth();
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.contentContainer}>
          {/* Logo/Header Section */}
          <View style={styles.headerSection}>
            <Image 
              source={require('@/assets/images/plant-calendar-logo.png')} 
              style={styles.logo}
            />
            <Text style={styles.welcomeText}>Welcome Back!</Text>
            <Text style={styles.subtitleText}>Sign in to continue</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#666"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#666"
            />
            
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          </View>

          {/* Social Login Section */}
          <View style={styles.socialSection}>
            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.orText}>Or continue with</Text>
              <View style={styles.line} />
            </View>

            <TouchableOpacity 
              style={styles.googleButton} 
              onPress={handleGoogleLogin}
            >
              <Image 
                source={require('@/assets/images/google-logo.png')} 
                style={styles.googleIcon}
              />
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View style={styles.signupSection}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text style={styles.signupLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5eef0',
  },
  keyboardView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    borderRadius: 100,
  },
  welcomeText: {
    fontSize: 24,
    fontFamily: 'PoppinsSemiBold',
    color: '#694449',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    fontFamily: 'Poppins',
    color: '#694449',
  },
  formSection: {
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    fontFamily: 'Poppins',
    backgroundColor: '#F8F8F8',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#694449',
    fontFamily: 'PoppinsMedium',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#694449',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'PoppinsSemiBold',
  },
  socialSection: {
    marginBottom: 30,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  orText: {
    marginHorizontal: 16,
    color: '#666',
    fontFamily: 'Poppins',
    fontSize: 14,
  },
  googleButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  googleIcon: {
    width: 24,
    height: 24,
  },
  signupSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontFamily: 'Poppins',
    color: '#666',
    fontSize: 14,
  },
  signupLink: {
    fontFamily: 'PoppinsSemiBold',
    color: '#694449',
    fontSize: 14,
  },
}); 