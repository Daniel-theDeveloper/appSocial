import { localUserLogin } from './localstorage';

export function isWasInteracted(array) {
    let key = false;

    array.find(function (res) {
        if (res == localUserLogin.username) {
            key = true;
        }
    });
    return key;
}

export function isWasFollow(array) {
    let key = false;

    array.find(function (res) {
        if (res == localUserLogin.id) {
            key = true;
        }
    });
    return key;
}

export function isWasCommented(comments_array) {
    if (comments_array.length != 0) {
        let key = false;

        comments_array.find(function (res) {
            if (res.user === localUserLogin.username) {
                key = true;
            }
        });

        return key;
    } else {
        return false
    }
    
}