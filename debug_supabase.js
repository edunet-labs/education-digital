const apiKey = 'sb_publishable_9evs6gjZXb0MKLNiY4m9WQ_whyH9_Vy';
const url = 'https://oyuuoggizhycteybakeh.supabase.co/rest/v1/forum_topics?select=*,forum_replies(*)&limit=1';

fetch(url, {
    headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`
    }
})
    .then(response => {
        console.log('Status:', response.status);
        return response.text();
    })
    .then(data => console.log('Data:', data))
    .catch(err => console.error('Error:', err));
