.PHONY: install supabase-init dev ios android supabase-start \
        db-create-migration db-migrate db-reset \
        edge-new edge-deploy edge-deploy-one edge-serve \
        env-push env-pull build-ios build-android \
        build-preview-ios build-preview-android ota-update

# .env dosyasından değişkenleri otomatik oku
-include .env
export

# ── Setup ──────────────────────────────────────────────────────
install:
	npm install && npx expo install --fix

supabase-init:
	supabase login
	supabase link --project-ref yqvalrbdgfhvesynsozx

# ── Development ────────────────────────────────────────────────
dev:
	npx expo start

ios:
	npx expo run:ios

android:
	npx expo run:android

supabase-start:
	supabase start

# ── Database ───────────────────────────────────────────────────
# Usage: make db-create-migration name=init_schema
db-create-migration:
	supabase migration new $(name)

db-migrate:
	supabase db push

db-reset:
	supabase db reset

# ── Edge Functions ─────────────────────────────────────────────
# Usage: make edge-new name=create-generation-job
edge-new:
	supabase functions new $(name)

edge-deploy:
	supabase functions deploy

# Usage: make edge-deploy-one name=create-generation-job
edge-deploy-one:
	supabase functions deploy $(name)

edge-serve:
	supabase functions serve

# ── Environment ────────────────────────────────────────────────
env-push:
	supabase secrets set \
	  FAL_KEY=$(FAL_KEY) \
	  RESEND_API_KEY=$(RESEND_API_KEY) \
	  REVENUECAT_WEBHOOK_SECRET=$(REVENUECAT_WEBHOOK_SECRET) \
	  SUPABASE_SERVICE_ROLE_KEY=$(SUPABASE_SERVICE_ROLE_KEY)

env-pull:
	supabase secrets list

# ── Build ──────────────────────────────────────────────────────
build-ios:
	eas build --platform ios --profile production

build-android:
	eas build --platform android --profile production

build-preview-ios:
	eas build --platform ios --profile preview

build-preview-android:
	eas build --platform android --profile preview

# Usage: make ota-update msg="hotfix: credit display"
ota-update:
	eas update --branch production --message "$(msg)"
