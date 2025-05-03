// import somethingRoutes from 'somewhere/someroutes.js'

/*
you will be making three routes/pages in your application:

http://localhost:3000/  this is the homepage where users can either create an account or login to their existing account
http://localhost:3000/login  this is the login page where users can enter their credentials to log in
http://localhost:3000/home when logged in, users will be brought to a homepage where they can see the main interface page
http://localhost:3000/profile  users can click on one of the buttons at the header to see their profile
http://localhost:3000/


*/



export function constructorMethod(app) {
    if(typeof app === "undefined") {
        throw new Error(`App is not defined!`);
    }

    // app.use('/route', somethingRoutes)

    app.use('*', (req, res) => {
        return res.status(404).json({error: 'Not found'});
    });
}