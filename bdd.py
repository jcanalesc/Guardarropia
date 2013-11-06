from flask import *

import sqlite3

app = Flask(__name__)

@app.route("/")
def index():
	return render_template("index.html")

@app.route("/<action>/")
def operacion(action):
	with sqlite3.connect("guardarropia.db") as db:
		db.row_factory = sqlite3.Row

		cur = db.cursor()
		codigo = request.args.get('codigo', None)
		res = {
			"items": [],
			"available": -1,
			"lastinsertion": 0,
			"success": False
		}
		try:
			if action == "get":
				cur.execute("select * from guardarropia where codigo = ?", (codigo,))
				for row in cur:
					res["items"].append(dict([(x, row[x]) for x in row.keys()]))
			elif action == "add":
				descr = request.args.get("descr", "")
				lugar = request.args.get("lugar", "")
				cur.execute("insert into guardarropia (codigo, descr, lugar) values (?,?,?)", (codigo, descr, lugar))
				res["lastinsertion"] = cur.lastrowid
			elif action == "mod":
				idi = request.args.get("idi", "")
				descr = request.args.get("descr", "")
				cur.execute("update guardarropia set descr = ? where idi = ?", (descr, idi))
			else: # rem
				idi = request.args.get("idi", "")
				cur.execute("delete from guardarropia where id = ?", (idi,))
			cur.execute("select lugar from guardarropia group by lugar")
			used = set([x[0] for x in cur])
			res["available"] = min(set(range(1,1001)) - used)
			res["success"] = True
		except sqlite3.IntegrityError:
			res["success"] = False
		return jsonify(res)

if __name__ == "__main__":
	app.run("0.0.0.0", debug=True, port=7000)