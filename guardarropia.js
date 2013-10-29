var DB = {
	getPrendas: function(cod)
	{
		if (cod.length > 0)
		{
			$.getJSON("prendas.php", { codigo: cod }, function(obj)
			{
				if (obj.success)
				{
					
				}
				else
				{
					alert(obj.error);
					return [];
				}
			});
		}
	},
	addPrenda: function(cod, descr)
	{
		if (cod.length > 0 && descr.length > 0)
		{
			$.getJSON("addprenda.php", { codigo: cod, descripcion: descr }, function(obj)
			{
				if (obj.success)
				{
					return true;
				}
				else
				{
					alert(obj.error);
					return false;
				}
			});
		}
	}
};

function procesaCodigo(cod)
{
	var prendas = DB.getPrendas(cod);
	if (prendas.length == 0)
	{
		
	}
	else
	{

	}
}

$(function()
{
	$("#iCodigo").on("keyup", function(ev)
	{
		if (ev.which == 13)
		{
			procesaCodigo($(this).val());
			$(this).val("");
		}
	});
});