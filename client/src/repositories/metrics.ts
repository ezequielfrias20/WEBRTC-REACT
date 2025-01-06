import axios from "axios";

const apiUrl = process.env.REACT_APP_API_URL;

const endpoint = '/metrics'


export const createMetrics = async (payload: any) => {

    const headers = {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}`
      }

    console.log('[PAYLOAD CREATE METRICS]: ', payload);

    try {

        const response = await axios.post(`${apiUrl + endpoint}`,  payload, {
            headers
        });

        console.log("[CREATE METRICS]: ", response)

        return {
            status: 'success',
            message: '',
            data: response,
        }

    } catch (error: any) {
        console.log(error?.response)
        return {
            status: 'error',
            message: 'Ha ocurrido un error',
            data: [],
        }
    }
}