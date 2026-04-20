{
  "entities": {
    "deal": {
      "title": "Deal",
      "description": "Represents a company listing submitted by a seller.",
      "type": "object",
      "properties": {
        "status": {
          "type": "string",
          "enum": ["pending", "published", "rejected"],
          "description": "Status of the deal. Sellers submit as pending."
        },
        "ownerId": {
          "type": "string",
          "description": "Auth UID of the seller who submitted the deal."
        },
        "nombreFantasia": {
          "type": "string"
        },
        "cuit": {
          "type": "string"
        },
        "industria": {
          "type": "string"
        },
        "region": {
          "type": "string"
        },
        "descripcion": {
          "type": "string"
        },
        "revenue": {
          "type": "number"
        },
        "ebitda": {
          "type": "number"
        },
        "crecimiento": {
          "type": "string"
        },
        "deuda": {
          "type": "number"
        },
        "askingPrice": {
          "type": "number"
        },
        "tipoSocietario": {
          "type": "string"
        },
        "jurisdiccion": {
          "type": "string"
        },
        "representante": {
          "type": "string"
        },
        "telefono": {
          "type": "string"
        },
        "email": {
          "type": "string"
        },
        "createdAt": {
          "type": "timestamp"
        },
        "updatedAt": {
          "type": "timestamp"
        }
      },
      "required": ["status", "ownerId", "nombreFantasia", "createdAt"]
    },
    "user": {
      "title": "User",
      "description": "A user of the application",
      "type": "object",
      "properties": {
        "role": {
          "type": "string",
          "enum": ["seller", "buyer", "admin"],
          "description": "User's role."
        },
        "email": {
          "type": "string"
        },
        "initials": {
          "type": "string"
        }
      },
      "required": ["role", "email"]
    }
  },
  "firestore": {
    "/deals/{dealId}": {
      "schema": {
        "$ref": "#/entities/deal"
      },
      "description": "Stores company listings."
    },
    "/users/{userId}": {
      "schema": {
        "$ref": "#/entities/user"
      },
      "description": "Stores user profiles and roles."
    }
  }
}
