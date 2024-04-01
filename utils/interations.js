import { globalUsername } from './localstorage';

export function isWasInteracted(array) {
    let key = false

    array.find(function(res) {
        if (res == globalUsername) {
            key = true
        }
    })
    if (key) {
        return true
    } else {
        return false
    }
}