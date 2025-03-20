// import somethingRoutes from 'somewhere/someroutes.js'

export function constructorMethod(app) {
    if(typeof app === "undefined") {
        throw new Error(`App is not defined!`);
    }

    // app.use('/route', somethingRoutes)

    app.use('*', (req, res) => {
        return res.status(404).json({error: 'Not found'});
    });
}