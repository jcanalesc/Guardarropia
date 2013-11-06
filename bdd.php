<?php
	$cx = new SQLite3("guardarropia.db");
	$cx->query("CREATE TABLE IF NOT EXISTS guardarropia (id INTEGER PRIMARY KEY autoincrement, codigo INTEGER, descr TEXT, lugar INTEGER)");
	$action_sql = array(
		"get" => "select * from guardarropia where codigo = %d",
		"add" => "insert into guardarropia (codigo, descr, lugar) values (%d, '%s', %d)",
		"rem" => "delete from guardarropia where id = %d"
	);
	// obtener lugar para el loco, si es que no tiene ya
	$codigo = $_GET['codigo'];

	$response = array(
		"items" => array(),
		"available" => -1,
		"lastinsertion" => 0
		);

	$query = "";
	switch($_GET['action'])
	{
		case "get":
			$query = sprintf($action_sql["get"], $_GET['codigo']);
		break;
		case "add":
			$query = sprintf($action_sql["add"], $_GET['codigo'], $_GET['descr'], $_GET['lugar']);
		break;
		case "rem":
			$query = sprintf($action_sql["rem"], $_GET['idi']);
		break;
	}
	//echo $query;
	$res = $cx->query($query);
	if ($res)
	{
		$response["success"] = true;
		if ($_GET['action'] == "add")
			$response["lastinsertion"] = $cx->lastInsertRowID();
		while($row = $res->fetchArray(SQLITE3_ASSOC))
		{
			$response["items"][] = $row;
		}
		$res2 = $cx->query("select lugar from guardarropia group by lugar");
		$available = range(1,1000);
		while($row = $res2->fetchArray(SQLITE3_ASSOC))
			$available = array_diff($available, array($row['lugar']));
		$response["available"] = min($available);
	}
	else
	{
		$response["success"] = false;
	}
	echo json_encode($response);
?>