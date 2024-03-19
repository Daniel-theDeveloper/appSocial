import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Notifications() {
    return (
        <View style={styles.container}>
            <Text> notifications </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexGrow: 1,
        padding: 20,
    }
})