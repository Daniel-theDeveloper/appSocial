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

    const dateConverted = new Date(date * 1000);
    const dateString = dateConverted.toString();
    const d = dateString.split(' ');
    const finalDate = d[2] + " de " + d[1] + " del " + d[3];
    
    return finalDate;
}