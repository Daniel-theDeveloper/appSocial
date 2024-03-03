import React from 'react';
import { StyleSheet, Text } from 'react-native';

export default function notifications() {
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