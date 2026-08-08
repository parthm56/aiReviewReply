
async function request(endpoint, options = {}) {
    console.log(import.meta.env.VITE_API_BASE);
    const url = `${import.meta.env.VITE_API_BASE}/${endpoint}`;
    console.log(url);
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };
    const response = await fetch(url, config);
    const data = await response.json();
    console.log(data.ok);
    if(!response.ok) {
        throw new Error(data.error || 'Something went wrong');
    }
    return data;
}

export function register(name, email, password) {
    return request('auth/register', {
        method: 'POST',
        body: JSON.stringify({name, email, password})
    })
}

export function login(email, password) {
    return request('auth/login', {
        method: 'POST',
        body: JSON.stringify({email, password})
    });
}