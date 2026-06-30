import { useState } from 'react';
import {View,Text, TouchableOpacity,StyleSheet,Pressable} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import { AppRoutes } from './Routes';
import { useEffect } from "react";
import { getAnonymousIdToken } from "./services/firebase";
import { collectAndSendLocation } from "./services/location.service";

export default function App() {
  useEffect(() => {
    async function sendLocation() {
      try {
        const token = await getAnonymousIdToken();
        await collectAndSendLocation(token);
      } catch (error) {
        console.error("Erro ao enviar localizacao:", error);
      }
    }

    sendLocation();
  }, []);

  return <AppRoutes />;
}
