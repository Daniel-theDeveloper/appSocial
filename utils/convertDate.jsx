import { formatISO } from 'date-fns';

export function convertDate(date) {
    // Lo convierte en: 15 de Mar

    const dateConverted = new Date(date * 1000);
    const dateString = dateConverted.toString();
    const d = dateString.split(' ');
    const finalDate = d[2] + " de " + d[1];

    // console.log(d);
    // console.log(d[2] + " de " + d[1])
    return finalDate;
}

export function convertDateLarge(date) {
    // Lo convierte en: 15 de Mar del 2024

    const dateInMilliseconds = (date.seconds * 1000) + (date.nanoseconds / 1000000);
    const dateConverted = new Date(dateInMilliseconds);
    const dateString = dateConverted.toString();
    const d = dateString.split(' ');
    const finalDate = d[2] + " de " + d[1] + ". del " + d[3];

    return finalDate;
}

export function convertUniversalDate(date) {
    // Lo convierte en: 2024-05-04T17:11:52.562Z
    // try {
    //     const dateConverted = new Date(date * 1000);
    //     const dateString = dateConverted.toISOString();

    //     return dateString;
    // } catch (error) {
    //     console.error(error);
    //     return new Date();
    // }
    const dateInMilliseconds = (date.seconds * 1000) + (date.nanoseconds / 1000000);
    const d = new Date(dateInMilliseconds);

    const dateString = formatISO(d);

    return dateString;
}