from flask import *

import sqlite3

app = Flask(__name__)

def historial(cur,accion, **kwargs):
	cur.execute("INSERT INTO historial (accion, codigo, idi, descr, lugar) VALUES (?,?,?,?,?)", (accion, 
			kwargs.get("codigo", 0),
			kwargs.get("idi", 0),
			kwargs.get("descr", ""),
			kwargs.get("lugar", 0)))

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
			"lastinsertion": {},
			"success": False,
			"total" : 0
		}
		actionargs = {}
		try:
			if action == "get":
				cur.execute("select * from guardarropia where vigente = 1 and codigo = ?", (codigo,))
				for row in cur:
					res["items"].append(dict([(x, row[x]) for x in row.keys()]))
			elif action == "add":
				descr = request.args.get("descr", "")
				lugar = request.args.get("lugar", "")
				cur.execute("insert into guardarropia (codigo, descr, lugar, vigente) values (?,?,?, 1)", (codigo, descr, lugar))
				res["lastinsertion"] = {
					"id": cur.lastrowid,
					"codigo": codigo,
					"descr": descr,
					"lugar": lugar
				}
				actionargs = {
					"codigo": codigo,
					"descr": descr,
					"idi": cur.lastrowid,
					"lugar": lugar
				}
			elif action == "mod":
				idi = request.args.get("idi", "")
				descr = request.args.get("descr", "")
				cur.execute("update guardarropia set descr = ? where id = ?", (descr, idi))
				actionargs = {
					"descr": descr,
					"idi": idi
				}
			elif action == "rem": # rem
				idi = request.args.get("idi", "")
				cur.execute("update guardarropia set vigente = 0 where id = ?", (idi,))
				actionargs = {
					"idi": idi
				}
			elif action == "remall": # remall
				cur.execute("update guardarropia set vigente = 0")
			cur.execute("select count(*) from guardarropia where vigente = 1")
			res["total"] = cur.fetchone()[0]
			cur.execute("select lugar from guardarropia where vigente = 1 group by lugar")
			used = set([x[0] for x in cur])
			res["available"] = min(set(range(1,1001)) - used)
			historial(cur, action,**actionargs)
			res["success"] = True
		except Exception:
			res["success"] = False
		return jsonify(res)

if __name__ == "__main__":
	app.run("0.0.0.0", debug=True, port=7000)