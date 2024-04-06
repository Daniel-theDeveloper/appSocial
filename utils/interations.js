import { globalUsername } from './localstorage';

export function isWasInteracted(array) {
    let key = false;

    array.find(function (res) {
        if (res == globalUsername) {
            key = true;
        }
    });
    return key;
}

export function isWasCommented(comments_array) {
    if (comments_array.length != 0) {
        let key = false;

        comments_array.find(function (res) {
            if (res.user === globalUsername) {
                key = true;
            }
        });

        return key;
    } else {
        console.log("VACIA D:")
        return false
    }
    
}