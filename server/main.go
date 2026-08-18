package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/config"
	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/internal/handler"
	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/internal/router"
	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/service"
)

func main() {
	cfg := config.Load()

	httpClient := &http.Client{Timeout: 30 * time.Second}

	authService := service.NewAuthService(httpClient, cfg.OAuth)
	businessService := service.NewBusinessService(authService, httpClient, cfg.PublicAPI)
	recipientService := service.NewRecipientService(authService, httpClient, cfg.PublicAPI)
	form1099UtilityService := service.NewForm1099UtilityService(authService, httpClient, cfg.PublicAPI)
	form1099NecService := service.NewForm1099NecService(authService, httpClient, cfg.PublicAPI)
	form1099MiscService := service.NewForm1099MiscService(authService, httpClient, cfg.PublicAPI)
	draftPdfService := service.NewDraftPdfService(cfg.S3)

	authHandler := handler.NewAuthHandler(authService)
	businessHandler := handler.NewBusinessHandler(businessService)
	recipientHandler := handler.NewRecipientHandler(recipientService)
	form1099UtilityHandler := handler.NewForm1099UtilityHandler(form1099UtilityService, draftPdfService)
	form1099NecHandler := handler.NewForm1099NecHandler(form1099NecService)
	form1099MiscHandler := handler.NewForm1099MiscHandler(form1099MiscService)
	engine := router.New(authHandler, businessHandler, recipientHandler, form1099UtilityHandler, form1099NecHandler, form1099MiscHandler)

	server := &http.Server{
		Addr:              ":" + cfg.Server.Port,
		Handler:           engine,
		ReadHeaderTimeout: time.Duration(cfg.Server.ReadTimeoutSec) * time.Second,
		WriteTimeout:      time.Duration(cfg.Server.WriteTimeoutSec) * time.Second,
	}

	go func() {
		log.Printf("server running on port %s", cfg.Server.Port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server failed: %v", err)
		}
	}()

	shutdownSignals := make(chan os.Signal, 1)
	signal.Notify(shutdownSignals, syscall.SIGINT, syscall.SIGTERM)
	<-shutdownSignals

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(cfg.Server.ShutdownTimeoutSec)*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Printf("graceful shutdown failed: %v", err)
		_ = server.Close()
	}
}
