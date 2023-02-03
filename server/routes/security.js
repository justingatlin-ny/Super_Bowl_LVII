export const verify = (req, res, next) => {
    const { user_id, access_token } = res.locals;
    if (user_id && access_token) return next();
    return res.status(403).send('You are not logged in.  Refresh the page and try again.');
}