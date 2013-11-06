var DB = {
	getPrendas: function(cod, callback)
	{
		if (cod.length > 0)
		{
			$.getJSON("/get/", {
				codigo: cod
			}, function(obj)
			{
				callback(obj);
			});
		}
	},
	addPrenda: function(cod, descr, lugar, callback)
	{
		if (descr.length > 0 && lugar.length > 0)
		{
			$.getJSON("/add/", {
				codigo: cod,
				descr: descr,
				lugar: lugar
			}, function(obj)
			{
				callback(obj);
			});
		}
	},
	modPrenda: function(cod, idi, descr, callback)
	{
		$.getJSON("/mod/", {
			codigo: cod,
			idi: idi,
			descr: descr
		}, function(res)
		{	
			callback(res);
		});
	},
	remPrenda: function(cod, idi, callback)
	{
		$.getJSON("/rem/", {
			codigo: cod,
			idi: idi
		}, function(res)
		{
			callback(res);
		});
	}
};

var $rowtemplate = null;
var $emptytemplate = null;
var $itemtemplate = null;
var activepages = [];



function addNewItemRow(item)
{
	DB.getPrendas("0", function(dbres)
	{
		$("tbody.itemlist", item.get()).append($itemtemplate
				.replace("%descr%", "Agregue descripción")
				.replace("%lugar%", dbres.available)
				.replace("%idi%", "new")
				.replace("%buttonlabel%", "Asignar"));
		$("tbody.itemlist button").click(buttonhandler);
	});
}

function buttonhandler()
{
	var rowref = $(this).parent().parent();
	var tableref = rowref.parent();
	var id = rowref.data("idi");
	var codigo = tableref.data("codigo");
	var buttonref = $(this);
	var itemref = tableref.parent().parent();
	if (id == "new")
	{
		var descripcion = $(this).parent().parent().find("input[type='text']").val();
		var percha = $(this).parent().prev().text();
		DB.addPrenda(codigo, descripcion, percha, function(res)
		{
			if (res.success)
			{
				alert("agregada");
				rowref.data("idi", res.lastinsertion);
				buttonref.html("Liberar");
			}
		});
	}
	else
	{
		DB.remPrenda(codigo, id, function(res)
		{
			if (res.success)
			{
				alert("eliminada");
				rowref.hide().remove();
				console.log(tableref);
				if (tableref.find("tr").length == 0)
				{
					console.log(itemref);
					addNewItemRow(itemref);
				}

			}
		});
	}
}
function procesaCodigo(cod)
{
	if (activepages.indexOf(cod) != -1) return;
	DB.getPrendas(cod, function(res)
	{
		activepages.push(cod);
		var item = $($rowtemplate.html().replace(/%codigo%/g, cod));
		for (var i = 0; i < res.items.length; i++)
		{
			$("tbody.itemlist", item.get()).append($itemtemplate
				.replace("%descr%", res.items[i].descr)
				.replace("%lugar%", res.items[i].lugar)
				.replace("%idi%", res.items[i].id)
				.replace("%buttonlabel%", "Liberar"));
		}
		if (res.items.length == 0)
		{
			addNewItemRow(item, res);
		}
		$("button.close", item.get()).click(function()
		{
			$(this).parent().hide().remove();

			activepages.splice(activepages.indexOf($(this).parent().data("codigo")));
		});
		$("button.actionbutton", item.get()).click(buttonhandler);
		$(".bAgregar", item.get()).click(function()
		{
			console.log(this);
			var itemr = $(this).parent();
			addNewItemRow(itemr);
		});

		$("#iTabla").append(item);
		item.slideDown("slow");

	});
}

$(function()
{
	$rowtemplate = $(".templateitem");
	$emptytemplate = $(".templateempty");
	$itemtemplate = "<tr data-idi='%idi%'><td><input type='text' class='form-control' value='%descr%' /></td><td>%lugar%</td><td><button class='btn actionbutton'>%buttonlabel%</button></td></tr>";
	$("#iCodigo").focus();
	$("#iCodigo").on("keyup", function(ev)
	{
		if (ev.which == 13)
		{
			procesaCodigo($(this).val());
			$(this).val("");
		}
	});
	$("#iCodigoBtn").click(function()
	{
		procesaCodigo($("#iCodigo").val());
		$("#iCodigo").val("");
	});
});