var DB = {
	getPrendas: function(cod, callback)
	{
		if (cod.length > 0 && /[0-9]+/.test(cod))
		{
			$.getJSON("/get/", {
				codigo: cod
			}, function(obj)
			{
				$("#sTotal").html(obj.total);
				callback(obj);
			});
		}
	},
	addPrenda: function(cod, descr, lugar, callback)
	{
		if (descr.length > 0 && /[0-9]+/.test(cod))
		{
			$.getJSON("/add/", {
				codigo: cod,
				descr: descr,
				lugar: lugar
			}, function(obj)
			{
				$("#sTotal").html(obj.total);
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
			$("#sTotal").html(res.total);
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
			$("#sTotal").html(res.total);
			callback(res);
		});
	},
	vaciar: function(callback)
	{
		$.getJSON("/remall/", function(res)
		{
			if (res.success)
				callback(res);
		});
	}
};

var $rowtemplate = null;
var $emptytemplate = null;
var $itemtemplate = null;
var activepages = [];
var buffer = "";
function inputhandler2(ev)
{
	var selfref = $(this);
	var rowref = $(this).parent().parent();
	var tableref = rowref.parent();
	var id = rowref.data("idi");
	var codigo = tableref.data("codigo");
	var buttonref = $(this).parent().next().next().find("button");
	var itemref = tableref.parent().parent();
	var descripcion = $(this).val();
	DB.modPrenda(codigo, id, descripcion, function(res)
	{
		if (res.success)
		{
			//alert("modificada");
			selfref.parent().find(".toggleable").toggle();
			selfref.parent().find("span.toggleable").html(descripcion);
		}
	});
}

function inputhandler(ev)
{
	if (ev.which != 13) return;
	$(this).blur();
	ev.stopPropagation();
}


function addNewItemRow(item)
{
	DB.getPrendas("0", function(dbres)
	{
		DB.addPrenda(item.data("codigo"), "Una prenda", dbres.available, function(res)
		{
			$("tbody.itemlist", item.get()).append($itemtemplate
				.replace(/%descr%/g, res.lastinsertion.descr)
				.replace("%lugar%", res.lastinsertion.lugar)
				.replace("%idi%", res.lastinsertion.id)
				.replace("%buttonlabel%", "Liberar"));
			$("tbody.itemlist button", item.get()).click(buttonhandler);
			$("tbody.itemlist input", item.get()).keydown(inputhandler).blur(inputhandler2);
			$("tbody.itemlist span.toggleable", item.get()).click(function()
			{
				$(this).parent().find("span.toggleable").hide().parent().find("input.toggleable").show().select().focus();
			}).show();
			$("tbody.itemlist input.toggleable", item.get()).hide();
		});
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
	DB.remPrenda(codigo, id, function(res)
	{
		if (res.success)
		{
			//alert("eliminada");
			rowref.hide().remove();
			//console.log(tableref);

		}
	});
}
function procesaCodigo(cod)
{
	if (activepages.indexOf(cod) != -1)
	{
		$("div[data-codigo='"+cod+"']").hide().remove();
		activepages.splice(activepages.indexOf(cod));
	};
	DB.getPrendas(cod, function(res)
	{
		activepages.push(cod);
		var item = $($rowtemplate.html().replace(/%codigo%/g, cod));
		for (var i = 0; i < res.items.length; i++)
		{
			$("tbody.itemlist", item.get()).append($itemtemplate
				.replace(/%descr%/g, res.items[i].descr)
				.replace("%lugar%", res.items[i].lugar)
				.replace("%idi%", res.items[i].id)
				.replace("%buttonlabel%", "Liberar"));
		}
		
		$("button.close", item.get()).click(function()
		{
			$(this).parent().slideUp("slow", function()
				{
					$(this).remove();
				});

			activepages.splice(activepages.indexOf($(this).parent().data("codigo")));
		});
		$(".bAgregar", item.get()).click(function()
		{
			var itemr = $(this).parent();
			addNewItemRow(itemr);
		});
		$("#iTabla").prepend(item);
		$("tbody.itemlist button", item.get()).click(buttonhandler);
		$("tbody.itemlist input", item.get()).keydown(inputhandler).blur(inputhandler2).select().focus();
		$("tbody.itemlist span.toggleable").show().click(function()
		{
			$(this).parent().find("span.toggleable").hide().parent().find("input.toggleable").show().select().focus();
		});
		$("tbody.itemlist input.toggleable").hide();
		if (res.items.length == 0)
		{
			item.slideDown("slow", function()
			{
				addNewItemRow(item);
				$("input", item.get()).last().select().focus();
			});
		}
		else
		{
			item.slideDown("slow");
		}
		$("input", item.get()).on("keydown keypress", function(ev)
		{	
			ev.stopPropagation();
		});
		
	});
}

$(function()
{
	$rowtemplate = $(".templateitem");
	$emptytemplate = $(".templateempty");
	$itemtemplate = "<tr data-idi='%idi%'><td><span class='btn btn-block toggleable'>%descr%</span><input type='text' class='form-control toggleable' value='%descr%' /></td><td class='percha'>%lugar%</td><td><button class='btn btn-lg btn-info btn-block actionbutton'>%buttonlabel%</button></td></tr>";
	$("#bVaciar").click(function()
	{
		if (confirm("Realmente desea vaciar la guardarropía?"))
		{
			DB.vaciar(function()
			{
				alert("Guardarropía vaciada.");
			});
		}
	});
	$(document).keypress(function(ev)
	{
		if (ev.which == 35)
		{
			buffer = "";
		}
		else if (ev.which == 13 && buffer != "")
		{
			procesaCodigo(buffer);
			buffer = "";
		}
		else if (48 <= ev.which && ev.which <= 57) // numeros
		{
			buffer += String.fromCharCode(ev.which);
		}
	});
	$("input").on("keydown keypress", function(ev)
	{	
		ev.stopPropagation();
	});
});	