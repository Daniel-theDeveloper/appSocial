import React from 'react';
import { StyleSheet, Text } from 'react-native';

export default function homepage() {
    return (
        <View style={styles.container}>
            <Text> homepage </Text>
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