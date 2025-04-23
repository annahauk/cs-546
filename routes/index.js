// import somethingRoutes from 'somewhere/someroutes.js'
import AuthRoutes from "./authroutes.js"

export function constructorMethod(app) {
    if(typeof app === "undefined") {
        throw new Error(`App is not defined!`);
    }

    // app.use('/route', somethingRoutes)

    // auth routes
    app.use("/route", AuthRoutes);

    app.use('*', (req, res) => {
        return res.status(404).json({error: 'Not found'});
    });
}