import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function createPost() {
    return (
        <View style={styles.container}>
            <Text> createPost </Text>
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