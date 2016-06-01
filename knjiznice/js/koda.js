
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";


/**
 * Prijava v sistem z privzetim uporabnikom za predmet OIS in pridobitev
 * enolične ID številke za dostop do funkcionalnosti
 * @return enolični identifikator seje za dostop do funkcionalnosti
 */
function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}

var tabela=[
    {fn: 'Simona', ln: 'Markovska',dr: '1996-10-15T13:40Z',hl: 175, bw: 74, temp: 37.6, s: 119, d: 85, o: 97},
    {fn: 'Trajko', ln: 'Bogdanovski',dr: '1975-08-25T19:55Z',hl: 186, bw: 80, temp: 38.4, s: 125, d: 65, o: 99},
    {fn: 'Marina', ln: 'Burdus',dr: '1940-02-09T01:30Z',hl: 189, bw: 90, temp: 37.5, s: 130, d: 86, o: 95},
];


/**
 * Generator podatkov za novega pacienta, ki bo uporabljal aplikacijo. Pri
 * generiranju podatkov je potrebno najprej kreirati novega pacienta z
 * določenimi osebnimi podatki (ime, priimek in datum rojstva) ter za njega
 * shraniti nekaj podatkov o vitalnih znakih.
 * @param stPacienta zaporedna številka pacienta (1, 2 ali 3)
 * @return ehrId generiranega pacienta
 */
 function generirajPodatke(stPacienta) {
    var sessionId=getSessionId();
  
    var t=tabela[stPacienta-1];
    $.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
	});
    $.ajax({
    		    url: baseUrl + "/ehr",
    		    type: 'POST',
    		    success: function(ehr){
    		       
    		        var partyData={
    		            firstNames: t.fn,
		                lastNames: t.ln,
		                dateOfBirth: t.dr,
		                partyAdditionalInfo: [{key: "ehrId", value: ehr.ehrId}]
    		        };
    		        $.ajax({
		                url: baseUrl + "/demographics/party",
		                type: 'POST',
		                contentType: 'application/json',
		                data: JSON.stringify(partyData),
		                success: function(party){
		                    var podatki = {
			            		    "ctx/language": "en",
                        		    "ctx/territory": "SI",
                        		    
                        		    "vital_signs/height_length/any_event/body_height_length": t.hl,
                        		    "vital_signs/body_weight/any_event/body_weight": t.bw,
                        		   	"vital_signs/body_temperature/any_event/temperature|magnitude": t.temp,
                        		    "vital_signs/body_temperature/any_event/temperature|unit": "°C",
                        		    "vital_signs/blood_pressure/any_event/systolic": t.s,
                        		    "vital_signs/blood_pressure/any_event/diastolic": t.d,
                        		    "vital_signs/indirect_oximetry:0/spo2|numerator": t.o,
                        	};
                    		var parametriZahteve = {
                    		    ehrId: ehr.ehrId,
                    		    templateId: 'Vital Signs',
                    		    format: 'FLAT',
                    		    
                    		};
                			$.ajax({
                    		    url: baseUrl + "/composition?" + $.param(parametriZahteve),
                    		    type: 'POST',
                    		    contentType: 'application/json',
                    		    data: JSON.stringify(podatki),
                    		    success: function(comp){
                    		        t.ehrId=ehr.ehrId;
                    		        var ehrIds='<br>'+tabela[0].ehrId+'<br>'+ tabela[1].ehrId+'<br>'+ tabela[2].ehrId;
                    		        $("#statusMessage").html("<span class='label label-success fade-in'>Uspešno kreirani tri EHR: " +ehrIds + ".</span>");
                    		        $("#selectPatient").html('<option/>');
                    		        for(var i=0; i<tabela.length; i++){
                    		            $("#selectPatient").append($('<option>', { value : tabela[i].ehrId}).text(tabela[i].fn+' '+tabela[i].ln));
                    		        }
                    		    }
	                        })
		                } 
		                    
		            })
    		    }      

    })    		            
}

function generirajPodatkeKlik(){
    for(var i=1; i <= 3; i++){
        generirajPodatke(i);
    }
};

function popolniPodatki(ehrId){
    if(!ehrId){
       $('#EHR').val('');
       $('#DatumInUra').val('');
       $('#TelesnaVisina').val('');
       $('#TelesnaTeza').val('');
       $('#TelesnaTemperatura').val('');
       $('#KrvniTlakSistolicni').val('');
       $('#KrvniTlakDiastolicni').val('');
       $('#NasicenostKrviSKisikom').val('');
       return;
    }
    
    var sessionId=getSessionId();
  
    $.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
	});
    $.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
			type: 'GET',
			success: function(data){
	    	    $('#EHR').val(ehrId);
	    	    $('#DatumInUra').val(data.party.dateOfBirth);
	    	    
	    	    $.ajax({
	    	        url: baseUrl+ "/view/"+ehrId+"/height",
	    	        type: 'GET',
	    	        success: function(heights){
	    	            $('#TelesnaVisina').val(heights[0].height);
	    	        }
	    	    });
	    	    
	    	     $.ajax({
	    	        url: baseUrl+ "/view/"+ehrId+"/weight",
	    	        type: 'GET',
	    	        success: function(weights){
	    	            $('#TelesnaTeza').val(weights[0].weight);
	    	        }
	    	    });
	    	    
	    	   $.ajax({
	    	        url: baseUrl+ "/view/"+ehrId+"/body_temperature",
	    	        type: 'GET',
	    	        success: function(temperatures){
	    	            $('#TelesnaTemperatura').val(temperatures[0].temperature);
	    	        }
	    	    });
	    	    
	    	    $.ajax({
	    	        url: baseUrl+ "/view/"+ehrId+"/blood_pressure",
	    	        type: 'GET',
	    	        success: function(pressures){
	    	            $('#KrvniTlakSistolicni').val(pressures[0].systolic);
	    	            $('#KrvniTlakDiastolicni').val(pressures[0].diastolic);
	    	        }
	    	    });
	    	    
	    	    $.ajax({
	    	        url: baseUrl+ "/view/"+ehrId+"/spO2",
	    	        type: 'GET',
	    	        success: function(spO2){
	    	            $('#NasicenostKrviSKisikom').val(spO2[0].spO2);
	    	        }
	    	    });
	    	    
	    	}
    })
}
