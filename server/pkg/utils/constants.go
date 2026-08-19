package utils

// Upstream endpoint paths on the TaxBandits public API, appended to the
// configured PublicAPI base URL by each service.
const (
	BusinessCreateEndpoint     = "/business/create"
	BusinessGetEndpoint        = "/business/get"
	BusinessUpdateEndpoint     = "/business/update"
	BusinessListEndpoint       = "/business/list"
	BusinessDeleteEndpoint     = "/business/delete"
	BusinessReactivateEndpoint = "/business/reactivate"
	BusinessDeactivateEndpoint = "/business/deactivate"
	BusinessAddDBAEndpoint     = "/business/adddba"
	BusinessUpdateDBAEndpoint  = "/business/updatedba"
	BusinessDeleteDBAEndpoint  = "/business/deletedba"
	BusinessListDBAEndpoint    = "/business/listdba"

	RecipientListEndpoint       = "/recipient/list"
	RecipientGetEndpoint        = "/recipient/get"
	RecipientCreateEndpoint     = "/recipient/create"
	RecipientUpdateEndpoint     = "/recipient/update"
	RecipientDeleteEndpoint     = "/recipient/delete"
	RecipientReactivateEndpoint = "/recipient/reactivate"
	RecipientDeactivateEndpoint = "/recipient/deactivate"
	RecipientAssignEndpoint     = "/recipient/assignrecipients"
	RecipientUnassignEndpoint   = "/recipient/unassignrecipients"
	RecipientAddDBAEndpoint     = "/recipient/adddba"
	RecipientUpdateDBAEndpoint  = "/recipient/updatedba"
	RecipientListDBAEndpoint    = "/recipient/listdba"
	RecipientDeleteDBAEndpoint  = "/recipient/deletedba"

	Form1099UtilityListEndpoint               = "/form1099/list"
	Form1099UtilityStatusEndpoint             = "/form1099/status"
	Form1099UtilityRequestDraftPdfUrlEndpoint = "/form1099/requestdraftpdfurl"
	Form1099UtilityRequestPdfUrlsEndpoint     = "/form1099/requestpdfurls"
	Form1099UtilityDeleteEndpoint             = "/form1099/delete"
	Form1099UtilityTransmitEndpoint           = "/form1099/transmit"
	Form1099UtilityStatusLogEndpoint          = "/form1099/statuslog"

	Form1099NecCreateEndpoint       = "/form1099nec/create"
	Form1099NecGetEndpoint          = "/form1099nec/get"
	Form1099NecUpdateEndpoint       = "/form1099nec/update"
	Form1099NecValidateFormEndpoint = "/form1099nec/validateform"

	Form1099MiscCreateEndpoint       = "/form1099misc/create"
	Form1099MiscUpdateEndpoint       = "/form1099misc/update"
	Form1099MiscGetEndpoint          = "/form1099misc/get"
	Form1099MiscValidateFormEndpoint = "/form1099misc/validateform"
)
