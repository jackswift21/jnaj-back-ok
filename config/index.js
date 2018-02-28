module.exports = {
	'secret': process.env.JNAJ_SECRET || 'tacos-or-bust',
	'db':"mongodb://localhost:27017/jnaj_local",
	/*process.env.MONGODB_URI || "mongodb://js21_admin0_db:l0ne21star20!db"+
    "@cluster0-shard-00-00-kqjd9.mongodb.net:27017,"+
    "cluster0-shard-00-01-kqjd9.mongodb.net:27017,"+
    "cluster0-shard-00-02-kqjd9.mongodb.net:27017/test?"+
    "ssl=true&replicaSet=Cluster0-shard-0&authSource=admin",*/
    'db_conn_msg':"listening on 27017...",//"on the Atlas Cloud..."
	'port': process.env.PORT || 3000,
	'uploadDir':'./uploads/'}