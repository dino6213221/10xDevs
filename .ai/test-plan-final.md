# Plan Testów dla Projektu 10xDevs

## 1. Wprowadzenie i cele testowania

### 1.1. Informacje o projekcie
Projekt 10xDevs jest aplikacją webową opartą na technologiach React i Astro, wykorzystującą bazę danych Supabase. Aplikacja wykorzystuje technologie TypeScript i ma architekturę opartą o komponenty React.

### 1.2. Cele testowania
- Zapewnienie wysokiej jakości oprogramowania poprzez kompleksowe testowanie wszystkich elementów aplikacji
- Weryfikacja zgodności funkcjonalności z wymaganiami biznesowymi
- Identyfikacja potencjalnych problemów i błędów przed wdrożeniem do środowiska produkcyjnego
- Walidacja poprawności integracji między komponentami i zewnętrznymi serwisami
- Zapewnienie odpowiedniej wydajności i bezpieczeństwa aplikacji

## 2. Zakres testów

### 2.1. Komponenty podlegające testowaniu
- Komponenty frontendowe React (w tym AIModal i inne widoki)
- Integracja z Supabase (autentykacja, baza danych)
- Routing i nawigacja w aplikacji
- API i endpointy serwisowe
- Funkcjonalność AI do generowania fiszek
- System fiszek (włącznie z nowym systemem propozycji fiszek)
- Mechanizmy autoryzacji i uwierzytelniania

### 2.2. Elementy wyłączone z zakresu testów
- Biblioteki i narzędzia zewnętrzne (zakładamy, że są już przetestowane)
- Testowanie wydajnościowe bazy danych na dużych zbiorach danych (powyżej 100 000 rekordów)

## 3. Typy testów do przeprowadzenia

### 3.1. Testy jednostkowe
- Testowanie pojedynczych komponentów React
- Testowanie funkcji pomocniczych i utilities
- Testowanie walidatorów i logiki biznesowej

#### Przykładowe narzędzia:
- Jest
- React Testing Library
- Vitest

### 3.2. Testy integracyjne
- Testowanie współdziałania komponentów
- Testowanie integracji z Supabase
- Testowanie przepływów danych między warstwami aplikacji

#### Przykładowe narzędzia:
- Cypress (dla testów integracyjnych frontend)
- Supertest (dla testów API)

### 3.3. Testy e2e (end-to-end)
- Testowanie pełnych ścieżek użytkownika
- Testowanie procesu autentykacji
- Testowanie formularzy i walidacji

#### Przykładowe narzędzia:
- Cypress
- Playwright

### 3.4. Testy API
- Testowanie poprawności działania endpointów
- Testowanie obsługi błędów
- Testowanie limitów i brzegowych przypadków

#### Przykładowe narzędzia:
- Postman
- REST Client (dodatek do VS Code)
- Supertest

### 3.5. Testy wydajnościowe
- Testowanie czasu ładowania aplikacji
- Testowanie wydajności operacji na bazie danych
- Testowanie optymalizacji zapytań

#### Przykładowe narzędzia:
- Lighthouse
- k6

### 3.6. Testy bezpieczeństwa
- Testowanie mechanizmów autoryzacji
- Audyt bezpieczeństwa Supabase
- Testowanie ochrony przed typowymi atakami (XSS, CSRF)

#### Przykładowe narzędzia:
- OWASP ZAP
- Supabase security checklist

### 3.7. Testy dostępności (a11y)
- Testowanie zgodności z WCAG 2.1
- Testowanie nawigacji za pomocą klawiatury
- Testowanie czytników ekranu

#### Przykładowe narzędzia:
- Axe
- Pa11y

## 4. Scenariusze testowe dla kluczowych funkcjonalności

### 4.1. Scenariusze testowe dla systemu fiszek

#### 4.1.1. Generowanie fiszek z wykorzystaniem AI
1. **Warunki wstępne**: Użytkownik jest zalogowany, ma dostęp do funkcji generowania fiszek
2. **Kroki**:
    - Otwarcie modalu generowania fiszek
    - Wprowadzenie tekstu źródłowego (różne warianty długości)
    - Kliknięcie "Generate Flashcard"
    - Sprawdzenie wyniku generowania
3. **Oczekiwany wynik**: Poprawnie wygenerowana fiszka z frontem i tyłem

#### 4.1.2. Walidacja w formularzu AIModal
1. **Warunki wstępne**: Użytkownik jest zalogowany, modal jest otwarty
2. **Kroki**:
    - Próba generowania z pustym polem tekstowym
    - Próba generowania z za krótkim tekstem (< 10 znaków)
    - Próba generowania z za długim tekstem (> 10000 znaków)
3. **Oczekiwany wynik**: Poprawne komunikaty walidacyjne, brak możliwości generowania przy błędach

#### 4.1.3. System propozycji fiszek
1. **Warunki wstępne**: Baza danych z tabelą flashcards zawiera kolumnę status
2. **Kroki**:
    - Utworzenie nowej fiszki (powinna otrzymać status 'proposal')
    - Sprawdzenie statusu w bazie danych
    - Zatwierdzenie fiszki (zmiana statusu na 'approved')
    - Sprawdzenie filtrowania fiszek według statusu
3. **Oczekiwany wynik**: Fiszki są prawidłowo oznaczane statusami, filtrowanie działa poprawnie

### 4.2. Scenariusze testowe dla autentykacji

#### 4.2.1. Rejestracja użytkownika
1. **Warunki wstępne**: Użytkownik nie jest zalogowany
2. **Kroki**:
    - Przejście do formularza rejestracji
    - Wprowadzenie danych użytkownika
    - Zatwierdzenie formularza
    - Weryfikacja konta (jeśli wymagana)
3. **Oczekiwany wynik**: Użytkownik zostaje zarejestrowany, otrzymuje dostęp do aplikacji

#### 4.2.2. Logowanie użytkownika
1. **Warunki wstępne**: Użytkownik jest zarejestrowany, niezalogowany
2. **Kroki**:
    - Przejście do formularza logowania
    - Wprowadzenie poprawnych danych
    - Zatwierdzenie formularza
3. **Oczekiwany wynik**: Użytkownik zostaje zalogowany, otrzymuje dostęp do aplikacji

#### 4.2.3. Obsługa błędów logowania
1. **Warunki wstępne**: Użytkownik jest zarejestrowany, niezalogowany
2. **Kroki**:
    - Wprowadzenie niepoprawnych danych logowania
    - Zatwierdzenie formularza
3. **Oczekiwany wynik**: System wyświetla odpowiedni komunikat błędu, użytkownik nie zostaje zalogowany

## 5. Środowisko testowe

### 5.1. Środowisko deweloperskie
- Lokalna instalacja aplikacji
- Lokalne środowisko Supabase lub testowe instancje chmurowe
- Emulatory przeglądarek (różne rozmiary ekranów)
- Node.js w wersji zdefiniowanej w .nvmrc

### 5.2. Środowisko testowe
- Instancja testowa aplikacji z wydzieloną bazą danych
- Automatyczne wdrażanie zmian z brancha testowego
- Ograniczony dostęp dla testerów

### 5.3. Środowisko przedprodukcyjne (staging)
- Konfiguracja jak najbardziej zbliżona do produkcyjnej
- Dane testowe odzwierciedlające dane produkcyjne (zanonimizowane)
- Pełna konfiguracja CI/CD

## 6. Narzędzia do testowania

### 6.1. Narzędzia do automatyzacji testów
- Jest/Vitest dla testów jednostkowych
- Cypress dla testów integracyjnych i e2e
- Playwright jako alternatywa dla testów e2e
- React Testing Library do testowania komponentów React

### 6.2. Narzędzia do testów manualnych
- Devtools przeglądarki
- Postman do testowania API
- Narzędzia do monitorowania sieci (np. Chrome Network Tab)

### 6.3. Narzędzia do analizy kodu
- ESLint z konfiguracją bezpieczeństwa
- SonarQube/SonarCloud dla statycznej analizy kodu
- Husky dla pre-commit hooks

### 6.4. Narzędzia do monitorowania i raportowania
- Datadog/New Relic do monitorowania wydajności
- GitHub Issues do śledzenia błędów
- CI/CD (GitHub Actions) do automatyzacji procesu testowania

## 7. Harmonogram testów

### 7.1. Testy regularne
- Testy jednostkowe: wykonywane automatycznie przy każdym commit/push
- Testy integracyjne: wykonywane automatycznie przy każdym PR do głównej gałęzi
- Testy e2e: wykonywane raz dziennie na środowisku testowym

### 7.2. Testy przed wdrożeniem
- Testy regresji: przed każdym wdrożeniem do środowiska produkcyjnego
- Testy wydajnościowe: przed każdym wdrożeniem z istotnymi zmianami w bazie danych lub API
- Testy bezpieczeństwa: raz na miesiąc i przed większymi wdrożeniami

### 7.3. Testy ad-hoc
- Eksploracyjne: wykonywane przez testerów raz w tygodniu
- Testy użyteczności: przeprowadzane na wybranych użytkownikach po implementacji nowych funkcjonalności

## 8. Kryteria akceptacji testów

### 8.1. Kryteria ilościowe
- Pokrycie testami jednostkowymi: minimum 80%
- Pokrycie testami integracyjnymi: minimum 70% kluczowych ścieżek
- Zero krytycznych błędów i podatności bezpieczeństwa
- Maksymalny czas odpowiedzi API: 500ms dla 95% zapytań

### 8.2. Kryteria jakościowe
- Zgodność z wymaganiami funkcjonalnymi
- Spójność interfejsu użytkownika
- Poprawność działania na wszystkich wspieranych przeglądarkach
- Dostępność zgodna z WCAG 2.1 poziom AA

## 9. Role i odpowiedzialności w procesie testowania

### 9.1. Zespół deweloperski
- Tworzenie i wykonywanie testów jednostkowych
- Tworzenie testów integracyjnych dla nowych funkcjonalności
- Naprawianie błędów zgłaszanych przez testerów

### 9.2. Testerzy QA
- Wykonywanie testów manualnych i eksploracyjnych
- Tworzenie i utrzymywanie automatycznych testów e2e
- Raportowanie i śledzenie błędów

### 9.3. DevOps
- Utrzymanie infrastruktury testowej
- Konfiguracja i utrzymanie pipeline'ów CI/CD
- Monitorowanie wydajności środowisk

### 9.4. Product Owner/Manager
- Definiowanie kryteriów akceptacji dla funkcjonalności
- Priorytetyzacja błędów
- Akceptacja ostateczna przed wdrożeniem

## 10. Procedury raportowania błędów

### 10.1. Format zgłoszenia błędu
- Tytuł: krótki opis problemu
- Środowisko: gdzie wystąpił błąd
- Kroki reprodukcji: dokładny opis jak wywołać błąd
- Aktualny rezultat: co się dzieje
- Oczekiwany rezultat: co powinno się dziać
- Załączniki: zrzuty ekranu, logi, nagrania wideo (jeśli dostępne)

### 10.2. Proces obsługi błędów
- Triage: ocena ważności i przydzielenie priorytetu
- Przypisanie: przydzielenie do odpowiedzialnego dewelopera
- Naprawa: implementacja rozwiązania
- Weryfikacja: sprawdzenie czy błąd został naprawiony
- Zamknięcie: dokumentacja rozwiązania

### 10.3. Priorytety błędów
- **Krytyczny**: uniemożliwia działanie kluczowych funkcjonalności, wymaga natychmiastowej naprawy
- **Wysoki**: znacząco utrudnia korzystanie z aplikacji, wymaga naprawy przed następnym wdrożeniem
- **Średni**: ogranicza funkcjonalność, ale istnieją obejścia, planowana naprawa w najbliższych iteracjach
- **Niski**: drobne usterki UI, nieoptymalne rozwiązania, planowane w dalszej przyszłości

## Podsumowanie

Plan testów został opracowany z uwzględnieniem specyfiki projektu 10xDevs, który jest aplikacją webową opartą na React, Astro i Supabase. Szczególną uwagę poświęcono testowaniu mechanizmów związanych z fiszkami, w tym nowo wprowadzonemu systemowi propozycji fiszek oraz funkcjonalności generowania fiszek z wykorzystaniem AI.

Realizacja przedstawionego planu testów powinna zapewnić wysoką jakość oprogramowania, minimalizując ryzyko wystąpienia błędów w środowisku produkcyjnym. Plan zakłada zarówno testy automatyczne, jak i manualne, co pozwala na kompleksowe pokrycie wszystkich aspektów aplikacji.

Regularny przegląd i aktualizacja planu testów są zalecane w miarę rozwoju projektu i wprowadzania nowych funkcjonalności.