import { globalUsername } from './localstorage';

export function isWasLiked(likes) {
    let key = false

    likes.find(function(res) {
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