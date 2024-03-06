import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function chats() {
    return (
        <View style={styles.container}>
            <Text> chats </Text>
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