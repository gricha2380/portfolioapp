let loginRoute = 
app.post('/login', (request, response) => {
    console.log('login username from body',request.body.username)
    if (!request.body.username || !request.body.password) {
        console.log('incomplete request')
        response.status(400).send(('bad'));
    } else {
        // embrace the future.
        isAuthorized(request.body)
            .then(creds => {
                console.log('pocessing results of checkLogin')
                if (!creds) {console.log('wrong username'); response.status(401).send({'response':'wrong username, buddy!'});};
                creds.forEach(e => { 
                    if (e.screenname) {
                        if (e.screenname === request.body.username && e.password === request.body.password) {
                            __USERID__ = e.id; 
                            console.log('userID is now:',__USERID__)
                            console.log('auth looks alright to me');
                            return response.status(200).send({'response':'user & passwords match!'});
                        } else if (e.screenname !== creds.username){
                            return console.log('bad username');response.status(400).send('username not found!!')
                        }
                        else {
                            // return {"status":402}
                            return console.log('wrong username');response.json({'response':'wrong username'})
                        }
                    } 
                });
            }); 
    }
});
module.exports.loginRoute = loginRoute;