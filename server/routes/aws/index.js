import axios from 'axios'

export default async () => {
    return await axios.get(process.env.AWS_PAY_SCRIPT)
    .then(res => {
        console.log(res.data);
        return res;
    })
    .catch(err => {
        console.log(err.message);
        return err;
    });
};