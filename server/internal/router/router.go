// Package router wires the Gin engine, registering middleware and every
// HTTP route the server exposes onto the handlers that implement them.
package router

import (
	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/internal/handler"
	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/internal/middleware"
	"github.com/gin-gonic/gin"
)

// New builds the Gin engine for the server, registering CORS/logging/
// recovery middleware and every /auth, /business, /recipient,
// /form1099utility, /form1099nec, and /form1099misc route onto the given
// handlers.
func New(
	authHandler handler.AuthHandler,
	businessHandler handler.BusinessHandler,
	recipientHandler handler.RecipientHandler,
	form1099UtilityHandler handler.Form1099UtilityHandler,
	form1099NecHandler handler.Form1099NecHandler,
	form1099MiscHandler handler.Form1099MiscHandler,
) *gin.Engine {
	gin.SetMode(gin.ReleaseMode)

	router := gin.New()
	router.Use(middleware.CORS(), middleware.Logger(), middleware.Recovery())

	router.POST("/auth/gettoken", authHandler.GetJWTToken)

	businessRoutes := router.Group("/business")
	{
		businessRoutes.POST("/create", businessHandler.Create)
		businessRoutes.GET("/get", businessHandler.Get)
		businessRoutes.PUT("/update", businessHandler.Update)
		businessRoutes.GET("/list", businessHandler.List)
		businessRoutes.DELETE("/delete", businessHandler.Remove)
		businessRoutes.GET("/reactivate", businessHandler.Reactivate)
		businessRoutes.GET("/deactivate", businessHandler.Deactivate)
		businessRoutes.POST("/adddba", businessHandler.AddDBA)
		businessRoutes.PUT("/updatedba", businessHandler.UpdateDBA)
		businessRoutes.GET("/listdba", businessHandler.ListDBA)
		businessRoutes.DELETE("/deletedba", businessHandler.DeleteDBA)
	}

	recipientRoutes := router.Group("/recipient")
	{
		recipientRoutes.GET("/list", recipientHandler.List)
		recipientRoutes.GET("/get", recipientHandler.Get)
		recipientRoutes.POST("/create", recipientHandler.Create)
		recipientRoutes.PUT("/update", recipientHandler.Update)
		recipientRoutes.DELETE("/delete", recipientHandler.Remove)
		recipientRoutes.GET("/reactivate", recipientHandler.Reactivate)
		recipientRoutes.GET("/deactivate", recipientHandler.Deactivate)
		recipientRoutes.POST("/assignrecipients", recipientHandler.AssignRecipients)
		recipientRoutes.POST("/unassignrecipients", recipientHandler.UnassignRecipients)
		recipientRoutes.POST("/adddba", recipientHandler.AddDBA)
		recipientRoutes.PUT("/updatedba", recipientHandler.UpdateDBA)
		recipientRoutes.GET("/listdba", recipientHandler.ListDBA)
		recipientRoutes.DELETE("/deletedba", recipientHandler.DeleteDBA)
	}

	form1099UtilityRoutes := router.Group("/form1099utility")
	{
		form1099UtilityRoutes.POST("/list", form1099UtilityHandler.List)
		form1099UtilityRoutes.GET("/status", form1099UtilityHandler.Status)
		form1099UtilityRoutes.GET("/requestdraftpdfurl", form1099UtilityHandler.RequestDraftPdfUrl)
		form1099UtilityRoutes.GET("/draftpdffile", form1099UtilityHandler.DraftPdfFile)
		form1099UtilityRoutes.GET("/requestpdfurls", form1099UtilityHandler.RequestPdfUrls)
		form1099UtilityRoutes.DELETE("/delete", form1099UtilityHandler.Delete)
		form1099UtilityRoutes.POST("/transmit", form1099UtilityHandler.Transmit)
		form1099UtilityRoutes.GET("/statuslog", form1099UtilityHandler.StatusLog)
	}

	form1099NecRoutes := router.Group("/form1099nec")
	{
		form1099NecRoutes.POST("/create", form1099NecHandler.Create)
		form1099NecRoutes.GET("/get", form1099NecHandler.Get)
		form1099NecRoutes.PUT("/update", form1099NecHandler.Update)
		form1099NecRoutes.POST("/validateform", form1099NecHandler.ValidateForm)
	}

	form1099MiscRoutes := router.Group("/form1099misc")
	{
		form1099MiscRoutes.POST("/create", form1099MiscHandler.Create)
		form1099MiscRoutes.PUT("/update", form1099MiscHandler.Update)
		form1099MiscRoutes.GET("/get", form1099MiscHandler.Get)
		form1099MiscRoutes.POST("/validateform", form1099MiscHandler.ValidateForm)
	}

	return router
}
