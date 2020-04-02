let appconfig = {}

appconfig.port = 3000;
appconfig.Crosorigin = "*";
appconfig.env = "dev";
appconfig.db = {
    uri :"mongodb://127.0.0.1:27017/mains"
};
appconfig.version = "0.0.1"

module.exports = {
    port: appconfig.port,
    domains: appconfig.Crosorigin,
    env: appconfig.env,
    db: appconfig.db,
    version: appconfig.version
}